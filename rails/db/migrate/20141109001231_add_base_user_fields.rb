class AddBaseUserFields < ActiveRecord::Migration
  def change
    add_column :users, :email_times, :hstore
    add_column :users, :email_key, :string

    add_column :users, :last_export_time, :datetime

    add_column :users, :plan, :string
    add_column :users, :plan_started, :datetime
    add_column :users, :plan_canceled, :datetime
    add_column :users, :plan_status, :string, default: 'needs_card'
    add_column :users, :stripe_customer_id, :string
    add_column :users, :last_4_digits, :string

    add_column :users, :time_zone, :string, default: 'US/Pacific'
    add_column :users, :status, :string, default: 'active'
  end
end
