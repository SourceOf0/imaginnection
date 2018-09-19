# frozen_string_literal: true

class Users::PasswordsController < Devise::PasswordsController
  # GET /resource/password/new
  # def new
  #   super
  # end

  # POST /resource/password
  def create
    # 参考：https://github.com/plataformatec/devise/blob/master/app/controllers/devise/passwords_controller.rb
    
    # 削除済みのアカウントには送信しない
    user = User.find_by(email: resource_params[:email])
    if !!user && user.deleted_at.nil?
      self.resource = resource_class.send_reset_password_instructions(resource_params)
    end
    yield resource if block_given?

    # 無効なアカウントでも表示は送信成功にしておく
    # 参考：https://nisshiee.hatenablog.jp/entry/2017/04/24/194311
    set_flash_message! :notice, :send_instructions
    respond_with({}, location: after_sending_reset_password_instructions_path_for(resource_name))
  end

  # GET /resource/password/edit?reset_password_token=abcdef
  # def edit
  #   super
  # end

  # PUT /resource/password
  def update
    # 参考：https://github.com/plataformatec/devise/blob/master/app/controllers/devise/passwords_controller.rb
    
    self.resource = resource_class.reset_password_by_token(resource_params)
    yield resource if block_given?

    if resource.errors.empty?
      resource.unlock_access! if unlockable?(resource)
      if Devise.sign_in_after_reset_password
        flash_message = resource.active_for_authentication? ? :updated : :updated_not_active
        set_flash_message!(:notice, flash_message)
        # パスワード変更後に自動ログインしない
        #sign_in(resource_name, resource)
      else
        set_flash_message!(:notice, :updated_not_active)
      end
      respond_with resource, location: after_resetting_password_path_for(resource)
    else
      set_minimum_password_length
      respond_with resource
    end
  end

  # protected

  # def after_resetting_password_path_for(resource)
  #   super(resource)
  # end

  # The path used after sending reset password instructions
  # def after_sending_reset_password_instructions_path_for(resource_name)
  #   super(resource_name)
  # end
end
