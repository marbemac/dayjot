HireFire::Resource.configure do |config|
  config.dyno(:worker) do
    HireFire::Macro::Delayed::Job.queue(mapper: :active_record)
  end
end