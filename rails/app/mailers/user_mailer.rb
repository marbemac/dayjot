class UserMailer < ActionMailer::Base
  default "Message-ID" => lambda {|_| "<#{SecureRandom.uuid}@dayjot.com>"}
  default from: "help@dayjot.com"

  def export_entries(user_id)
    @user = User.find(user_id)
    return unless @user
    @user.last_export_time = Time.now
    @user.save

    export_text = ""
    @user.entries.order("entry_date DESC").each do |e|
      export_text += "#{e.entry_date.strftime("%Y-%m-%d")}\n"
      export_text += e.body
      export_text += "\n\n"
    end

    filename = "dayjot_entries_#{Time.now.to_i}.txt"
    attachments[filename] = {:mime_type => 'text/plain', :content => export_text}    

    mail to: @user.email, subject: "Your DayJot Entry Export"        
  end
end
