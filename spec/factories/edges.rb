FactoryBot.define do
  factory :edge do
    
    association :user
    
    association :from_node
    association :to_node
    
    # 昨日作成した
    trait :at_yesterday do
      created_at { 1.day.ago }
    end
    
  end
end
