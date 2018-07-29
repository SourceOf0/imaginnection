Rails.application.configure do
  # Settings specified here will take precedence over those in config/application.rb.

  # The test environment is used exclusively to run your application's
  # test suite. You never need to work with it otherwise. Remember that
  # your test database is "scratch space" for the test suite and is wiped
  # and recreated between test runs. Don't rely on the data there!
  config.cache_classes = true

  # Do not eager load code on boot. This avoids loading your whole application
  # just for the purpose of running a single test. If you are using a tool that
  # preloads Rails for running tests, you may have to set it to true.
  config.eager_load = false

  # Configure public file server for tests with Cache-Control for performance.
  config.public_file_server.enabled = true
  config.public_file_server.headers = {
    'Cache-Control' => "public, max-age=#{1.hour.seconds.to_i}"
  }

  # Show full error reports and disable caching.
  config.consider_all_requests_local       = true
  config.action_controller.perform_caching = false

  # Raise exceptions instead of rendering exception templates.
  config.action_dispatch.show_exceptions = false

  # Disable request forgery protection in test environment.
  config.action_controller.allow_forgery_protection = false
  config.action_mailer.perform_caching = false

  # Tell Action Mailer not to deliver emails to the real world.
  # The :test delivery method accumulates sent emails in the
  # ActionMailer::Base.deliveries array.
  config.action_mailer.delivery_method = :test

  # Print deprecation notices to the stderr.
  config.active_support.deprecation = :stderr

  # Raises error for missing translations
  # config.action_view.raise_on_missing_translations = true

  # メーラー
  config.action_mailer.perform_deliveries = true
  config.action_mailer.raise_delivery_errors = true
  config.action_mailer.default_url_options = { host: 'localhost', port: 3000 }
  config.action_mailer.delivery_method = :smtp
  config.action_mailer.smtp_settings = {
    :enable_starttls_auto => true,
    :address => "smtp.gmail.com",
    :port => 587,
    :domain => 'gmail.com',
    :user_name => ENV['MAILER_USER_NAME'], #gmailアドレス
    :password => ENV['MAILER_PASSWORD'], #gmailパスワード
    :authentication => 'plain',
  }
  config.action_mailer.delivery_method = :letter_opener_web

  config.after_initialize do
    
    Bullet.enable = true   # bullet を有効にする
    
    # 以下はN+1問題を発見した時のユーザーへの通知方法
    Bullet.alert         = true # ブラウザのJavaScriptアラート
    Bullet.bullet_logger = true # Rails.root/log/bullet.log
    Bullet.console       = true # ブラウザの console.log の出力先
    Bullet.rails_logger  = true # Railsのログ
    #Bullet.bugsnag      = true # 総合デバッガツールbugsnag
    #Bullet.airbrake     = true # Airbrake
    #Bullet.raise        = true # Exceptionを発生
    Bullet.add_footer    = true # 画面の下部に表示
   
    # ホワイトリストを指定するときの例
    #Bullet.add_whitelist type: :n_plus_one_query, class_name: 'User', association: :prefecture
    #Bullet.add_whitelist type: :unused_eager_loading, class_name: 'User', association: :prefecture
    #Bullet.add_whitelist type: :counter_cache, class_name: 'User', association: :comments
    
  end
  
end
