class ApplicationMailer < ActionMailer::Base
  default to: 'imaginnection@gmail.com'
  default from: 'imaginnection_site@gmail.com'
  layout 'mailer'
end
