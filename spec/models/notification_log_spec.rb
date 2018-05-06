require 'rails_helper'

RSpec.describe NotificationLog, type: :model do
  
  # テストデータをセットアップする
  subject(:notification_log) { FactoryBot.build(:notification_log) }
  
  # ユーザがなければ無効な状態であること
  it { is_expected.to validate_presence_of(:user_id) }
  # 内容がなければ無効であること
  it { is_expected.to validate_presence_of(:content) }

end
