# This file is used by Rack-based servers to start the application.

require ::File.expand_path('../config/environment',  __FILE__)
run Rails.application

DelayedJobWeb.enable :sessions

if Rails.env.production?
  DelayedJobWeb.use Rack::Auth::Basic do |username, password|
    username == ENV['ADMIN_USER'] && password == ENV['ADMIN_PASSWORD']
  end
end