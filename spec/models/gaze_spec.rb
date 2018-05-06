require 'rails_helper'

RSpec.describe Gaze, type: :model do
  
  # テストデータをセットアップする
  let(:user) { FactoryBot.create(:user) }
  let(:other_user) { FactoryBot.create(:user) }
  let(:from_node) { FactoryBot.create(:node) }
  subject(:gaze) { FactoryBot.build(:gaze) }

  # ユーザがなければ無効な状態であること
  it { is_expected.to validate_presence_of(:user_id) }
  # ノードがなければ無効な状態であること
  it { is_expected.to validate_presence_of(:node_id) }
  
end
