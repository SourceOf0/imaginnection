class UserMailer < ApplicationMailer
  
  def user_welcome_mail(user)
    @resource = user
    mail(to: @resource.email, subject: t('.subject'))
  end
  
  def inquiry_email(inquiry)
    @inquiry = inquiry
    mail(subject: 'Imaginnectionへのお問い合わせ')
  end

end
