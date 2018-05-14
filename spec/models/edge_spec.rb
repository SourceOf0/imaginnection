require 'rails_helper'

RSpec.describe Edge, type: :model do

  # テストデータをセットアップする
  let(:user) { FactoryBot.create(:user) }
  let(:other_user) { FactoryBot.create(:user) }
  let(:from_node) { FactoryBot.create(:node) }
  let(:to_node) { FactoryBot.create(:node) }
  let(:other_node) { FactoryBot.create(:node) }
  subject!(:edge) { FactoryBot.create(:edge, user: user, from_node: from_node, to_node: to_node) }


  # ユーザがなければ無効な状態であること
  it { is_expected.to validate_presence_of(:user_id) }
  # 始点ノードがなければ無効な状態であること
  it { is_expected.to validate_presence_of(:from_node_id) }
  # 終点ノードがなければ無効な状態であること
  it { is_expected.to validate_presence_of(:to_node_id) }

  it "始点ノードが異なり、終点ノードが同じ紐づけを許可すること" do
    new_edge = FactoryBot.build(:edge, user: user, from_node: other_node, to_node: to_node)
    expect(new_edge).to be_valid
  end
  it "始点ノードが同じで、終点ノードが異なる紐づけを許可すること" do
    new_edge = FactoryBot.build(:edge, user: user, from_node: from_node, to_node: other_node)
    expect(new_edge).to be_valid
  end
  it "始点ノードと終点ノードが逆の紐づけを許可すること" do
    new_edge = FactoryBot.build(:edge, user: user, from_node: to_node, to_node: from_node)
    expect(new_edge).to be_valid
  end
  it "ユーザー単位では重複したノードへの紐づけを許可しないこと" do
    new_edge = FactoryBot.build(:edge, user: user, from_node: from_node, to_node: to_node)
    new_edge.valid?
    #expect(new_edge.errors[:user_id]).to include("has already been taken")
    expect(new_edge.errors[:user_id]).to include("はすでに存在します")
  end
  it "二人のユーザーが同じノードへの紐づけを使うことは許可すること" do
    other_edge = FactoryBot.build(:edge, user: other_user, from_node: from_node, to_node: to_node)
    expect(other_edge).to be_valid
  end
  
  it "指定のノードを含むエッジを持つユーザを取得できる" do
    other_edge = FactoryBot.create(:edge, user: other_user, from_node: from_node, to_node: to_node)
    aggregate_failures do
      expect(Edge.connected_users(from_node, to_node)).to include(user, other_user)
      expect(Edge.connected_users(to_node, from_node)).to_not include(user, other_user)
    end
  end
  
  describe "Userモデル経由" do
    
    it "始点ノードが異なり、終点ノードが同じ紐づけを許可する" do
      param = { from_node: other_node, to_node: to_node }
      new_edge = user.empathize(param)
      aggregate_failures do
        expect(new_edge).to be_valid
        expect(user.edges.find_by(param)).to eq new_edge
        expect(user.empathize?(target_edge: new_edge)).to be true
        expect(user.empathize?(param)).to be true
      end
    end
    
    it "始点ノードが同じで、終点ノードが異なる紐づけを許可する" do
      param = { from_node: from_node, to_node: other_node }
      new_edge = user.empathize(param)
      aggregate_failures do
        expect(new_edge).to be_valid
        expect(user.edges.find_by(param)).to eq new_edge
        expect(user.empathize?(target_edge: new_edge)).to be true
        expect(user.empathize?(param)).to be true
      end
    end
    
    it "始点ノードと終点ノードが逆の紐づけを許可する" do
      param = { from_node: to_node, to_node: from_node }
      new_edge = user.empathize(param)
      aggregate_failures do
        expect(new_edge).to be_valid
        expect(user.edges.find_by(param)).to eq new_edge
        expect(user.empathize?(target_edge: new_edge)).to be true
        expect(user.empathize?(param)).to be true
      end
    end
  
    it "ユーザー単位では重複したノードへの紐づけを許可しない" do
      param = { from_node: from_node, to_node: to_node }
      # 登録済みのエッジが返ってくる
      new_edge = user.empathize(param)
      aggregate_failures do
        expect(new_edge).to eq edge
        expect(user.edges.find_by(param)).to eq new_edge
        expect(user.empathize?(target_edge: new_edge)).to be true
        expect(user.empathize?(param)).to be true
      end
    end
  
    it "二人のユーザーが同じノードへの紐づけを使うことは許可すること" do
      param = { from_node: from_node, to_node: to_node}
      other_edge = other_user.empathize(param)
      aggregate_failures do
        expect(other_edge).to be_valid
        expect(user.edges.find_by(param)).to_not eq other_edge
        expect(user.empathize?(target_edge: other_edge)).to be true
        expect(user.empathize?(param)).to be true
      end
    end
  
  
    it "注視中のノードの最新エッジを取得できる" do
      gaze_from_node = FactoryBot.create(:gaze, user: user, node: from_node)
      other_edge = FactoryBot.create(:edge, user: other_user, from_node: from_node)
      old_edge = FactoryBot.create(:edge, :at_yesterday, user: user, from_node: from_node)
      aggregate_failures do
        expect(Edge.latest_edges(user)).to include(edge, other_edge)
        expect(Edge.latest_edges(user)).to_not include(old_edge)
      end
    end

  
    context "フォロー機能込み" do
      
      # テストデータをセットアップする
      let!(:own_edges) { 
        []
        .push(edge)
        .push(FactoryBot.create(:edge, user: user, from_node: from_node, to_node: other_node))
        .push(FactoryBot.create(:edge, user: user, from_node: other_node, to_node: to_node))
      }
      let!(:other_edges) { 
        []
        .push(FactoryBot.create(:edge, user: other_user, from_node: from_node, to_node: other_node))
        .push(FactoryBot.create(:edge, user: other_user, from_node: other_node, to_node: to_node))
      }

      it "フォローしていない場合は自分のみエッジ・ノードを取得できる" do
        aggregate_failures do
          expect(Edge.viewable_edges(user)).to match_array(own_edges)
          expect(Edge.viewable_edges(user)).to_not include(other_edges[0])
          expect(Edge.viewable_node_counts(user)[from_node]).to eq 2
          expect(Edge.viewable_node_counts(user)[to_node]).to eq 2
          expect(Edge.viewable_node_counts(user)[other_node]).to eq 2
        end
      end
      
      it "自分とフォローしている相手のエッジ・ノードを取得できる" do
        user.follow(other_user)
        aggregate_failures do
          expect(Edge.viewable_edges(user).length).to eq (own_edges.length + other_edges.length)
          expect(Edge.viewable_edges(user)).to match_array(own_edges + other_edges)
          expect(Edge.viewable_node_counts(user)[from_node]).to eq 3
          expect(Edge.viewable_node_counts(user)[to_node]).to eq 3
          expect(Edge.viewable_node_counts(user)[other_node]).to eq 4
        end
      end
      
      it "フォローしている相手が消えた場合は相手のエッジ分を含んでいない" do
        user.follow(other_user)
        other_user.destroy
        aggregate_failures do
          expect(Edge.viewable_edges(user)).to match_array(own_edges)
          expect(Edge.viewable_edges(user)).to_not include(other_edges[0])
          expect(Edge.viewable_node_counts(user)[from_node]).to eq 2
          expect(Edge.viewable_node_counts(user)[to_node]).to eq 2
          expect(Edge.viewable_node_counts(user)[other_node]).to eq 2
        end
      end
      
      
      it "特定のノードに紐づくユーザを取得できる" do
        aggregate_failures do
          expect(Edge.connected_users(from_node, to_node)).to include(user)
          expect(Edge.connected_users(from_node, to_node)).to_not include(other_user)
          expect(Edge.connected_users(from_node, other_node)).to include(user, other_user)
        end
      end
      
    end
    
  end

end
