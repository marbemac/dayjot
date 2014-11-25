class UserAddEmailsSent < ActiveRecord::Migration
  def change
    add_column :users, :reminder_emails_sent, :integer, default: 0
  end
end
