Rails.application.config.generators do |g|
  g.stylesheets false;
  g.javascripts false;
  g.helper false;
  g.skip_routes true;
  g.test_framework :rspec,
    fixtures: false,
    view_specs: false,
    helper_specs: false,
    routing_specs: false
end