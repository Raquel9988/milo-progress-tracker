// SettlePath browser configuration.
// The publishable key is designed for browser use with Row Level Security.
// Never place a Supabase secret or service-role key in this file.
window.SETTLEPATH_SUPABASE_CONFIG = Object.freeze({
    supabaseUrl: "https://cutluwxynreugipsglnk.supabase.co",
    supabasePublishableKey: "sb_publishable_LbOYhmsOA3O-OBuAROaovg_PcQj5bqs"
});

// Backward compatibility with earlier tracker versions.
window.MILO_SUPABASE_CONFIG = window.SETTLEPATH_SUPABASE_CONFIG;
