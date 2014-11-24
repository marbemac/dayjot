class CreateEntries < ActiveRecord::Migration
  def change
    create_table :entries, id: :uuid do |t|
      t.binary :encrypted_body
      t.text :body
      t.date :entry_date
      t.string :source, default: "web"
      t.uuid :user_id

      t.timestamps
    end

    add_index :entries, [:user_id, :entry_date]
  end
end
