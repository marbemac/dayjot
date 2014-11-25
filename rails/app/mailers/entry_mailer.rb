class EntryMailer < ActionMailer::Base
  helper :entries
  default "Message-ID" => lambda {|_| "<#{SecureRandom.uuid}@post.dayjot.com>"}

  def welcome(user_id)
    @user = User.find(user_id)
    return unless @user
    
    mail to: @user.email, from: "DayJot <#{@user.email_key}@post.dayjot.com>", subject: "Your first DayJot entry"
    
    @user.update_column(:last_reminder_sent_at, DateTime.now.utc)
  end

  def daily(user_id)
    @user = User.find(user_id)
    # Don't email if we can't find the user, or they've already been sent an email today.
    return if !@user || @user.daily_email_sent_today?
    
    @entry = @user.random_entry(Time.now.in_time_zone(@user.time_zone).strftime("%Y-%m-%d"))
    @show_entry = @user.entries.count > 5 && @entry ? true : false

    mail to: @user.email, 
         from: "DayJot <#{@user.email_key}@post.dayjot.com>", 
         subject: "It's #{Time.now.in_time_zone(@user.time_zone).strftime("%A, %b %-d")} - How did your day go?"

    @user.update_column(:last_reminder_sent_at, DateTime.now.utc)
    @user.increment!(:reminder_emails_sent)
  end
end
