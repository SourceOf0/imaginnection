FactoryBot.define do
  factory :user, aliases: [:from_user, :to_user] do
    
    sequence(:name) { |n| "テストユーザ#{n}" };
    sequence(:email) { |n| "tester#{n}@example.com" }
    password "dottle-nouveau-pavilion-tights-furze"

    
    # 一時的に使用する値
    transient do
      count 5
    end

    # エッジ持ち
    trait :with_edges do
      after(:create) do |user, evaluator|
        create_list(:edge, evaluator.count, user: user)
      end
    end
    
    # 注視設定持ち
    trait :with_gazes do
      after(:create) do |user, evaluator|
        create_list(:gaze, evaluator.count, user: user)
      end
    end
    
    # 通知持ち
    trait :with_notification_logs do
      after(:create) do |user, evaluator|
        create_list(:notification_log, evaluator.count, user: user)
      end
    end


    # 無効なモデル
    trait :invalid do
      name nil
    end

  end
end
