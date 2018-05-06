require 'rails_helper'

RSpec.describe User, type: :model do
  
  # テストデータをセットアップする
  subject(:user) { FactoryBot.build(:user) }

  # 名前がなければ無効であること
  it { is_expected.to validate_presence_of(:name) }
  # 名前は20文字以下であること
  it { is_expected.to validate_length_of(:name).is_at_most(20) }
  
  # メールアドレスがなければ無効であること
  it { is_expected.to validate_presence_of(:email) }
  # メールアドレスは255文字以下であること
  it { is_expected.to validate_length_of(:email).is_at_most(255) }
  # 重複したメールアドレスなら無効であること
  it { is_expected.to validate_uniqueness_of(:email).case_insensitive }

  it "たくさんのエッジを所有できること" do
    target_user = FactoryBot.create(:user, :with_edges, count: 5)
    expect(target_user.edges.length).to eq 5
  end
  
  it "たくさんの注視設定を所有できること" do
    target_user = FactoryBot.create(:user, :with_gazes, count: 5)
    expect(target_user.gazes.length).to eq 5
  end
  
  it "たくさんの通知を所有できること" do
    target_user = FactoryBot.create(:user, :with_notification_logs, count: 5)
    expect(target_user.notification_logs.length).to eq 5
  end
  
end
