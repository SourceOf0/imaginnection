source 'https://rubygems.org'

git_source(:github) { |repo| "https://github.com/#{repo}.git" }

ruby '2.6.6'

# Bundle edge Rails instead: gem 'rails', github: 'rails/rails'
gem 'rails', '~> 5.2.4'
# Use mysql as the database for Active Record
gem 'mysql2', '>= 0.4.4', '< 0.6.0'
# Use Puma as the app server
gem 'puma', '~> 3.12.4'
# Use SCSS for stylesheets
gem 'sass-rails', '~> 6.0'
# Use Uglifier as compressor for JavaScript assets
gem 'uglifier', '>= 1.3.0'
# See https://github.com/rails/execjs#readme for more supported runtimes
# gem 'mini_racer', platforms: :ruby
gem 'therubyracer'

# Use CoffeeScript for .coffee assets and views
gem 'coffee-rails', '~> 4.2'
# Build JSON APIs with ease. Read more: https://github.com/rails/jbuilder
gem 'jbuilder', '~> 2.5'
# Use Redis adapter to run Action Cable in production
# gem 'redis', '~> 4.0'
# Use ActiveModel has_secure_password
gem 'bcrypt', '~> 3.1.7'

# Use Capistrano for deployment
# gem 'capistrano-rails', group: :development

# Reduces boot times through caching; required in config/boot.rb
gem 'bootsnap', '>= 1.1.0', require: false

gem 'nokogiri', '>= 1.10.8'

group :development, :test do
  # Call 'byebug' anywhere in the code to stop execution and get a debugger console
  gem 'byebug', platforms: [:mri, :mingw, :x64_mingw]
end

group :development do
  # Access an interactive console on exception pages or by calling 'console' anywhere in the code.
  gem 'web-console', '>= 3.3.0'
  gem 'listen', '>= 3.0.5', '< 3.2'
  # Spring speeds up development by keeping your application running in the background. Read more: https://github.com/rails/spring
  gem 'spring'
  gem 'spring-watcher-listen', '~> 2.0.0'
end

# Windows does not include zoneinfo files, so bundle the tzinfo-data gem
gem 'tzinfo-data'


# CUSTUM------------

gem 'jquery-rails'
gem 'jquery-ui-rails'

# messages to internationalization
gem 'rails-i18n'

# Paginator 
gem 'kaminari', '>= 1.2.1'

# login system
gem 'devise'

# load environment variables from `.env` 
# please add dotenv-rails file `.env` to .gitignore
gem 'dotenv-rails'

# RFC 7519 OAuth JSON Web Token (use with CustomToken)
gem 'jwt'

group :development, :test do 
  # break point system
  gem 'pry-byebug'
  
  # alert N+1 Query
  gem 'bullet'
  
  gem 'rspec-rails', '~> 3.6.0'
  gem "factory_bot_rails"
  
  gem 'letter_opener_web', '~> 1.3.4'
end

group :development do 
  # please do "bundle exec spring binstub rspec"
  gem 'spring-commands-rspec' 
end

group :test do
  gem 'shoulda-matchers',
    git: 'https://github.com/thoughtbot/shoulda-matchers.git',
    branch: 'rails-5'
end

group :production do 
  # for heroku
  gem 'pg', '~> 0.19.0'
end
