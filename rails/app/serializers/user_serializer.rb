class UserSerializer < ActiveModel::Serializer
  attributes :id, :email, :email_times, :entry_months, :last_export_time, 
             :plan, :plan_started, :plan_canceled, :plan_status, :time_zone, :status, :entry_months,
             :created_at
end
