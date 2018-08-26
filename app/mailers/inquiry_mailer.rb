class InquiryMailer < ApplicationMailer
 
  def inquiry_email(inquiry)
    @inquiry = inquiry;
    mail(subject: 'imaginnectionへのお問い合わせ')
  end
  
end
