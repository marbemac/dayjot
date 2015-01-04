source 'https://rubygems.org'

ruby "2.1.4"

gem 'rails', '4.1.7'

# DB
gem 'pg'
gem 'pg_search'
gem 'randomized_field'

# authentication
gem 'devise'

# json api
gem 'active_model_serializers'

# Cors support
gem 'rack-cors', require: 'rack/cors'

# pagination
gem 'kaminari'

# payments
gem 'stripe'

# emails
gem 'mailgun'

# background processing
gem 'delayed_job_active_record'
gem 'delayed_job_web'

# heroku process management
gem "hirefire-resource"

# markdown
gem 'redcarpet'

# date parsing
gem 'chronic'

group :production do
  gem 'rails_12factor'
  gem 'puma'
  gem 'newrelic_rpm'
end

group :development, :test do
  gem 'rspec-rails', '~> 3.0'
  gem 'shoulda'
end

group :development do
  # Spring speeds up development by keeping your application running in the background. Read more: https://github.com/rails/spring
  gem 'spring'
  gem 'figaro'
  gem 'quiet_assets'
  gem 'foreman'
  gem 'byebug'
end
