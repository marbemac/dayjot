class UserAddTrialEnd < ActiveRecord::Migration
  def change
    add_column :users, :trial_end, :datetime
  end
end
