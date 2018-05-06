require 'rails_helper'

RSpec.describe Follow, type: :model do
  
  # テストデータをセットアップする
  let(:user) { FactoryBot.create(:user, is_enable_follow: true) }
  let(:enable_follow_user) { FactoryBot.create(:user, is_enable_follow: true) }
  let(:unenable_follow_user) { FactoryBot.create(:user, is_enable_follow: false) }

  # STIのモデルごとにテスト
  # 共通処理は spex/support/contexts/relationship_examples.rb で実装
  subject(:follow) { FactoryBot.build(:follow) }
  it_should_behave_like "relationship STI"
  
  
  describe "Userモデル経由" do
  
    it "フォローできる・アンフォローできる" do
      user.follow(enable_follow_user)
      expect(user.followings).to include(enable_follow_user)
      user.unfollow(enable_follow_user)
      expect(user.followings).to_not include(enable_follow_user)
    end
  
    it "新規フォローを受け付けていないユーザはフォローできない" do
      user.follow(unenable_follow_user)
      expect(user.followings).to_not include(unenable_follow_user)
    end
    
    it "自分自身をフォローすることはできない" do
      user.follow(user)
      expect(user.followings).to_not include(user)
    end
  
    it "特定日時以降のフォロワーを取得できる" do
      FactoryBot.create(:follow, from_user: enable_follow_user, to_user: user)
      FactoryBot.create(:follow, :at_yesterday, from_user: unenable_follow_user, to_user: user)
      aggregate_failures do
        expect(user.latest_followers).to include(enable_follow_user)
        expect(user.latest_followers).to_not include(unenable_follow_user)
      end
    end

  end
  
end
