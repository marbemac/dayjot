class AddPreviousEmailFlag < ActiveRecord::Migration
  def change
    add_column :users, :include_email_memory, :boolean, default: true
  end
end
