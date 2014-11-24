class EntryMailer < ActionMailer::Base
  helper :entries
  default "Message-ID" => lambda {|_| "<#{SecureRandom.uuid}@post.dayjot.com>"}

  def welcome(user_id)
    @user = User.find(user_id)
    return unless @user
    
    mail to: @user.email, from: "DayJot <#{@user.email_key}@post.dayjot.com>", subject: "Your first DayJot entry"
  end

  def daily(user_id)
    @user = User.find(user_id)
    return unless @user
    
    @entry = @user.random_entry(Time.now.in_time_zone(@user.time_zone).strftime("%Y-%m-%d"))
    @show_entry = @user.entries.count > 5 && @entry ? true : false

    mail to: @user.email, 
         from: "DayJot <#{@user.email_key}@post.dayjot.com>", 
         subject: "It's #{Time.now.in_time_zone(@user.time_zone).strftime("%A, %b %-d")} - How did your day go?"
  end
end
