FactoryBot.define do
  factory :notification_log do
    
    association :user
    sequence(:content) { |n| "通知#{n}" }
    
  end
end
