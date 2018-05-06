FactoryBot.define do
  factory :node, aliases: [:from_node, :to_node] do
    
    sequence(:name) { |n| "ノード#{n}" }
    
    # 一時的に使用する値
    transient do
      count 5
    end
    
    # 注視設定持ち
    trait :with_gazes do
      after(:create) do |node, evaluator|
        create_list(:gaze, evaluator.count, node: node)
      end
    end
    
  end
end
