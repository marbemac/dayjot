class Entry < ActiveRecord::Base
  include ActionView::Helpers::DateHelper
  include ActionView::Helpers::NumberHelper
  include PgSearch
  pg_search_scope :search_by_body, :against => :body

  belongs_to :user

  ###############
  # VALIDATIONS #
  ###############

  validates :user, presence: true
  validates :entry_date, presence: true
  validates :body, presence: true, length: { maximum: 50000 }

  validate :unique_entry_date

  # A user may only have one entry per day
  def unique_entry_date
    if user && user.entries
      existing = user.entries.select('id, entry_date').where("entry_date = ? AND id != ?", entry_date, id).first
    end
    if existing
      errors.add(:entry, "already exists for this date")
    end
  end

  #############
  # ACCESSORS #
  #############

  def unencrypted_body
    if encrypted_body
      encrypted_body
    else
      body
    end
  end

  ###########
  # HELPERS #
  ###########

  def prev_entry
    entry = Entry.select('id, entry_date').where("user_id = ? AND entry_date < ?", user_id, entry_date).order("entry_date DESC").first
    entry ? entry.entry_date : nil
  end

  def random_entry
    entry = Entry.select('id, entry_date').where("user_id = ? AND entry_date != ?", user_id, entry_date).order("RANDOM()").first
    entry ? entry.entry_date : nil
  end

  def next_entry
    entry = Entry.select('id, entry_date').where("user_id = ? AND entry_date > ?", user_id, entry_date).order("entry_date ASC").first
    entry ? entry.entry_date : nil
  end

  def time_ago(user)
    now = Time.now.in_time_zone(user.time_zone)
    date = Date.parse(entry_date.to_s)
    if date.day == 29 && date.month == 2 && now.year - 4 == date.year && now.day == 29 && now.month == 2
      "Last leap day, exactly 4 years"
    elsif now.month == date.month && now.day == date.day && now.year - 1 == date.year
      "Exactly 1 year"
    elsif now.month - 1 == date.month && now.day == date.day && now.year == date.year
      "Exactly 1 month"
    elsif now.month == date.month && now.day - 7 == date.day && now.year == date.year
      "Exactly 1 week"
    else
      in_words = distance_of_time_in_words(date, now).capitalize
      in_words.to_s.include?("Over") ? "Exactly #{number_with_delimiter((now - date).to_i / 1.day)} days" : in_words
    end
  end

  def sanitized_body
    body_sanitized = ActionView::Base.full_sanitizer.sanitize(self.body)
    body_sanitized.gsub!(/\A(\n\n)/,"") if body_sanitized
    body_sanitized.gsub!(/(\<\n\n>)\z/,"") if body_sanitized
    body_sanitized
  end

  # Runtime search.. This assumes users have < crazy # of entries.
  # def self.search(user, term)
  #   hits = []
  #   term.downcase!
  #   user.entries.each do |e|
  #     if e.body.downcase.include?(term)
  #       hits.push e.id
  #     end
  #   end
  #   Entry.where(id: hits)
  # end

end
