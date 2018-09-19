class ApplicationMailer < ActionMailer::Base
  default to: '"Imaginnection" <imaginnection@gmail.com>'
  default from: '"Imaginnection" <imaginnection@gmail.com>'
  layout 'mailer'
end
