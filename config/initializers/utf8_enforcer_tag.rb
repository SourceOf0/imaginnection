# submit_tag で付加されるutf8パラメータを消す
# 参考: https://www.mk-mode.com/octopress/2014/06/11/rails-commit-utf8-param-of-submit-tag/
module ActionView
  module Helpers
    module FormTagHelper
      def utf8_enforcer_tag
        "".html_safe
      end
    end
  end
end
