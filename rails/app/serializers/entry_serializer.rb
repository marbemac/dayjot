class EntrySerializer < ActiveModel::Serializer
  attributes :id, :body, :entry_date, :source, :user_id
end
