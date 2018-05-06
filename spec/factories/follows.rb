FactoryBot.define do
  factory :follow, parent: :relationship, class: 'Follow' do
    
    # relationshipを継承
    
    # 昨日作成した
    trait :at_yesterday do
      created_at 1.day.ago
    end

  end
end
