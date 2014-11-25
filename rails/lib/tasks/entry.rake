namespace :entry do

  # rake entry:send_entries_test
  task :send_hourly_entries_test => :environment do
    user = User.where(:email=>"test@example.com").first
    user.send_entry_email
  end

  task :send_hourly_entries => :environment do
    users = User.active.in_good_standing
    users.each do |user|
      if user.send_entry_email_now?
        user.send_entry_email
      end
    end
  end

  # Tmp task to import entries from legacy DB
  task :import => :environment do 
    # Remove all records
    User.delete_all
    Entry.delete_all

    file = File.read("#{Rails.root}/import/User.json")
    user_hash = JSON.parse(file)

    file = File.read("#{Rails.root}/import/Entry.json")
    entry_hash = JSON.parse(file)

    user_count = 0
    entry_count = 0

    user_hash["results"].each do |u|
      next unless u["email"] == "test@example.com"
      
      email_times = {}
      u["emailTimes"].each do |day,time|
        if time
          email_times[day] = Time.now.utc.change(hour: time.to_i).in_time_zone(u["timezone"]).hour
        end
      end
      
      user = User.create(
          email: u["email"],
          email_times: email_times,
          plan: u["plan"],
          plan_started: u["planStarted"] ? Chronic.parse(u["planStarted"]["iso"]) : nil,
          plan_status: u["planStatus"],
          status: u["status"],
          stripe_customer_id: u["stripeCustomerId"],
          time_zone: u["timezone"],
          password: SecureRandom.base64(20)
        )
      user_count += 1 if user.persisted?

      entry_hash["results"].each do |e|
        next unless e["user"]["objectId"] == u["objectId"]

        entry = Entry.create(
            body: e["body"],
            created_at: Chronic.parse(e["createdAt"]),
            entry_date: e["entryDate"],
            source: e["source"],
            updated_at: Chronic.parse(e["updatedAt"]),
            user: user
          )

        entry_count += 1 if entry.persisted?
      end
    end

    puts "Created #{user_count}/#{user_hash["results"].length} users and #{entry_count}/#{entry_hash["results"].length} entries."
  end

end