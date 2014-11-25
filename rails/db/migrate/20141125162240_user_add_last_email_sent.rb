class UserAddLastEmailSent < ActiveRecord::Migration
  def change
    add_column :users, :last_reminder_sent_at, :datetime
  end
end
