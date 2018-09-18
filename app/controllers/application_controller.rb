class ApplicationController < ActionController::Base
  
  # Prevent CSRF attacks by raising an exception.
  # For APIs, you may want to use :null_session instead.
  protect_from_forgery with: :exception

  # リダイレクト
  before_action :ensure_domain if ENV['DEFAULT_URL'] != nil
  
  # BASIC認証
  before_action :site_http_basic_authenticate_with if ENV['USE_BASIC'] == 'true'

  # deviseでのログイン認証
  before_action :authenticate_user!
  
  # deviseのstring parameter
  before_action :configure_permitted_parameters, if: :devise_controller?

  # ログ用
  before_action :print_info

  protected
  
  def ensure_domain
    default_host = ENV['DEFAULT_URL']
    if request.env['HTTP_HOST'] != default_host && Rails.env.production?
     redirect_to "#{request.protocol}#{default_host}#{request.fullpath}", status: 301
    end
  end

  def set_logger( name, text )
    logger.info 'LOG[ ' + name + ' ] ' + text
  end
  
  def site_http_basic_authenticate_with
    authenticate_or_request_with_http_basic("Application") do |name, password|
      name == ENV['BASIC_USERNAME'] && password == ENV['BASIC_PASSWORD']
    end
  end
  
  def print_info
    if user_signed_in?
      set_logger( 'login user accessed -> ' + request.path, current_user.ref_id + ' : ' + current_user.name )
    else
      set_logger( 'guest user accessed -> ' + request.path, '' )
    end
  end

  # deviseのstring parameter
  def configure_permitted_parameters
    devise_parameter_sanitizer.permit(:sign_up, keys: [:name, :empathy_button_kind, :is_disable_follow, :is_hide_edges])
    devise_parameter_sanitizer.permit(:account_update, keys: [:name, :empathy_button_kind, :is_disable_follow, :is_hide_edges])
  end

end
