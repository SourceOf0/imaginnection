FactoryBot.define do
  factory :relationship do
    
    association :from_user
    association :to_user

  end
end
