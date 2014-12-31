class User < ActiveRecord::Base
  # Include default devise modules. Others available are:
  # :confirmable, :lockable, :timeoutable and :omniauthable,  :registerable,  :rememberable
  devise :database_authenticatable, :recoverable, :trackable, :validatable

  before_create :set_default_settings
  before_destroy :cancel_plan
  after_create :send_welcome_email
  # after_save :updated_encrypted_entries

  has_many :entries, :dependent => :destroy

  randomized_field :authentication_token, :length => 20, :prefix => 'at'
  randomized_field :email_key, :length => 20, :prefix => 'dj'

  scope :not_new, -> { where("created_at < (?)", DateTime.now - 24.hours) }
  scope :active, -> { where("status = ?", "active") }
  scope :in_good_standing, -> { where("(plan_status = ? OR trial_end > ?)", "active", DateTime.now) }

  attr_accessor :stripe_token

  #############
  # CALLBACKS #
  #############

  def set_default_settings
    self.trial_end = Time.now + 1.month.to_i

    # default is 8PM
    unless email_times.present?
      self.email_times = {
        monday: 20,
        wednesday: 20,
        friday: 20
      }
    end
  end

  def send_welcome_email
    EntryMailer.delay.welcome(id)
  end

  ####################
  # CUSTOM ACCESSORS #
  #################### 

  def entry_months
    data = entries.select("COUNT(id) as count, to_char(entry_date,'YYYY-MM') as year_month").group("year_month").order("year_month DESC").to_a
    data.collect! {|x| {count: x.count, year_month: x.year_month} }
  end

  def can_export?
    # can export if they never have, or they haven't in the last 24 hours
    true if !last_export_time || Time.now - last_export_time > 24.hours.to_f
  end

  def random_entry(entry_date=nil)
    if entry_date.present?
      entry_date = Date.parse(entry_date.to_s)
      # return entry in the case of a leap year        
      if Date.leap?(entry_date.year) && entry_date.month == 2 && entry_date.day == 29 && leap_year_entry = entries.where(entry_date: (entry_date - 4.years).strftime("%Y-%m-%d")).first
        leap_year_entry
      # return entry from 1 year ago        
      elsif exactly_last_year_entry = entries.where(entry_date: entry_date.last_year.strftime("%Y-%m-%d")).first
        exactly_last_year_entry
      # return entry from 30 days ago        
      elsif (reminder_emails_sent % 3 == 0) && (exactly_30_days_ago = entries.where(entry_date: entry_date.last_month.strftime("%Y-%m-%d")).first)
        exactly_30_days_ago
      # return entry from 7 days ago
      elsif (reminder_emails_sent % 5 == 0) && (exactly_7_days_ago = entries.where(entry_date: (entry_date - 7.days).strftime("%Y-%m-%d")).first)
        exactly_7_days_ago
      else 
        count = entries.where("entry_date < ?", entry_date.last_year.strftime("%Y-%m-%d")).count
        # return old entry
        if count > 15
          entries.where("entry_date < ?", entry_date.last_year.strftime("%Y-%m-%d")).order("RANDOM()").first
        else
          self.random_entry
        end
      end
    else
      # just return a random entry for this user
      entries.order("RANDOM()").first
    end
  end 

  ###########
  # HELPERS #
  ###########

  def send_entry_email
    EntryMailer.delay.daily(id)
  end

  # true if it's the day and hour they want where they live        
  def send_entry_email_now?
    day = Time.now.in_time_zone(time_zone).strftime('%A').downcase
    preference = email_times[day]
    true if preference && preference == Time.now.in_time_zone(time_zone).hour.to_s
  end

  def daily_email_sent_today?
    last_reminder_sent_at && last_reminder_sent_at.in_time_zone(time_zone).strftime('%Y-%m-%d') == Time.now.in_time_zone(time_zone).strftime('%Y-%m-%d')
  end

  ############
  # PAYMENTS #
  ############
  
  def update_plan(new_plan=nil)
    current_plan = self.plan
    
    if stripe_customer_id.nil?
      if !stripe_token.present?
        raise "Stripe token not present. Can't create account."
      end
      if !new_plan.present?
        raise "Stripe plan not present. Can't create subscription."
      end
      customer = Stripe::Customer.create(
        :email => email,
        :description => email,
        :card => stripe_token,
        :plan => new_plan,
      )
    else
      customer = Stripe::Customer.retrieve(stripe_customer_id)
      if stripe_token.present?
        customer.card = stripe_token
      end
      customer.email = email
      customer.description = email
      customer.save

      if new_plan && new_plan != current_plan
        customer.update_subscription(:plan => new_plan)
      end
    end

    if new_plan
      self.plan = new_plan 

      if new_plan != current_plan
        self.plan_started = Time.now
      end
    end

    self.status = 'active'
    self.plan_status = 'active'
    self.last_4_digits = customer.cards.data.first["last4"]
    self.stripe_customer_id = customer.id
    self.stripe_token = nil

    true
  rescue Stripe::StripeError => e
    logger.error "Stripe Error: " + e.message
    errors.add :base, "Unable to update your subscription. #{e.message}."
    self.stripe_token = nil
    false
  end
  
  def cancel_plan
    unless stripe_customer_id.nil?
      customer = Stripe::Customer.retrieve(stripe_customer_id)
      unless customer.nil? or customer.respond_to?('deleted')
        subscription = customer.subscriptions.data[0]
        if subscription.status == 'active'
          customer.cancel_subscription
        end
        puts "subscription cancelled"
        puts subscription
      end
    end

    self.plan_canceled = Time.now
    self.plan_status = 'canceled'
    
    true    
  rescue Stripe::StripeError => e
    logger.error "Stripe Error: " + e.message
    errors.add :base, "Unable to cancel your subscription. #{e.message}."
    false
  end 
  
end
