# This file is auto-generated from the current state of the database. Instead
# of editing this file, please use the migrations feature of Active Record to
# incrementally modify your database, and then regenerate this schema definition.
#
# Note that this schema.rb definition is the authoritative source for your
# database schema. If you need to create the application database on another
# system, you should be using db:schema:load, not running all the migrations
# from scratch. The latter is a flawed and unsustainable approach (the more migrations
# you'll amass, the slower it'll run and the greater likelihood for issues).
#
# It's strongly recommended that you check this file into your version control system.

ActiveRecord::Schema.define(version: 20180902092023) do

  create_table "edges", force: :cascade, options: "ENGINE=InnoDB DEFAULT CHARSET=utf8" do |t|
    t.bigint "user_id"
    t.bigint "from_node_id"
    t.bigint "to_node_id"
    t.boolean "is_hide_user"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["from_node_id"], name: "index_edges_on_from_node_id"
    t.index ["to_node_id"], name: "index_edges_on_to_node_id"
    t.index ["user_id", "from_node_id", "to_node_id"], name: "index_edges_on_user_id_and_from_node_id_and_to_node_id", unique: true
    t.index ["user_id"], name: "index_edges_on_user_id"
  end

  create_table "gazes", force: :cascade, options: "ENGINE=InnoDB DEFAULT CHARSET=utf8" do |t|
    t.bigint "user_id"
    t.bigint "node_id"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["node_id"], name: "index_gazes_on_node_id"
    t.index ["user_id", "node_id"], name: "index_gazes_on_user_id_and_node_id", unique: true
    t.index ["user_id"], name: "index_gazes_on_user_id"
  end

  create_table "nodes", force: :cascade, options: "ENGINE=InnoDB DEFAULT CHARSET=utf8" do |t|
    t.string "name"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
  end

  create_table "notification_logs", force: :cascade, options: "ENGINE=InnoDB DEFAULT CHARSET=utf8" do |t|
    t.bigint "user_id"
    t.text "content"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["user_id"], name: "index_notification_logs_on_user_id"
  end

  create_table "relationships", force: :cascade, options: "ENGINE=InnoDB DEFAULT CHARSET=utf8" do |t|
    t.bigint "from_user_id"
    t.bigint "to_user_id"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.string "type"
    t.index ["from_user_id", "to_user_id"], name: "index_relationships_on_from_user_id_and_to_user_id", unique: true
    t.index ["from_user_id"], name: "index_relationships_on_from_user_id"
    t.index ["to_user_id"], name: "index_relationships_on_to_user_id"
  end

  create_table "users", force: :cascade, options: "ENGINE=InnoDB DEFAULT CHARSET=utf8" do |t|
    t.string "email", default: "", null: false
    t.string "encrypted_password", default: "", null: false
    t.string "reset_password_token"
    t.datetime "reset_password_sent_at"
    t.datetime "remember_created_at"
    t.integer "sign_in_count", default: 0, null: false
    t.datetime "current_sign_in_at"
    t.datetime "last_sign_in_at"
    t.string "current_sign_in_ip"
    t.string "last_sign_in_ip"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.string "name"
    t.boolean "is_disable_follow"
    t.integer "empathy_button_kind"
    t.date "notified_at"
    t.string "confirmation_token"
    t.datetime "confirmed_at"
    t.datetime "confirmation_sent_at"
    t.string "unconfirmed_email"
    t.integer "failed_attempts", default: 0, null: false
    t.string "unlock_token"
    t.datetime "locked_at"
    t.string "ref_id"
    t.boolean "is_hide_edges"
    t.datetime "deleted_at"
    t.index ["confirmation_token"], name: "index_users_on_confirmation_token", unique: true
    t.index ["email"], name: "index_users_on_email", unique: true
    t.index ["reset_password_token"], name: "index_users_on_reset_password_token", unique: true
    t.index ["unlock_token"], name: "index_users_on_unlock_token", unique: true
  end

  add_foreign_key "edges", "nodes", column: "from_node_id"
  add_foreign_key "edges", "nodes", column: "to_node_id"
  add_foreign_key "edges", "users"
  add_foreign_key "gazes", "nodes"
  add_foreign_key "gazes", "users"
  add_foreign_key "notification_logs", "users"
  add_foreign_key "relationships", "users", column: "from_user_id"
  add_foreign_key "relationships", "users", column: "to_user_id"
end
