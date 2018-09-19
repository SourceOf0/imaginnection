class InquiryController < ApplicationController
  
  # deviseでのログイン認証をスキップする
  skip_before_action :authenticate_user!
  
  def index
    @inquiry = Inquiry.new
    if user_signed_in?
      @inquiry.email = current_user.email
    end
  end
  
  def confirm
    @inquiry = Inquiry.new(inquiry_params)
    if @inquiry.valid?
      # 入力内容に問題ない場合、問い合わせ確認画面を表示
      render :confirm
    else
      # 入力内容に問題ある場合、問い合わせ画面を再表示
      render :index
    end
  end

  def send_mail
    @inquiry = Inquiry.new(inquiry_params)
    @inquiry.message = @inquiry.message.gsub(/\R/, "<br>").html_safe
    
    # メールを送信
    UserMailer.inquiry_email(@inquiry).deliver

    flash[:info] = 'お問い合わせありがとうございました'
    redirect_to root_path
  end
  
  
  private
  
  # Strong Paramter
  def inquiry_params
    params.require(:inquiry).permit(:user_id, :name, :email, :message)
  end
  
end
