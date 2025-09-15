use futures::stream::StreamExt;
use reqwest_eventsource::{Event, EventSource};
use tauri::{AppHandle, Emitter};

const NINJABRAIN_API: &'static str = "http://localhost:52533/api/v1";

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .invoke_handler(tauri::generate_handler![frontend_loaded])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}

#[tauri::command]
async fn frontend_loaded(app: AppHandle) {
    let handle = app.to_owned();
    tauri::async_runtime::spawn(async move { start_endpoint(&handle, "stronghold").await });
    let handle = app.to_owned();
    tauri::async_runtime::spawn(async move { start_endpoint(&handle, "boat").await });
    let handle = app.to_owned();
    tauri::async_runtime::spawn(async move { start_endpoint(&handle, "blind").await });
}

async fn start_endpoint(app: &AppHandle, endpoint: &'static str) -> ! {
    let url = format!("{NINJABRAIN_API}/{endpoint}/events");
    let mut es = EventSource::get(url);
    while let Some(event) = es.next().await {
        match event {
            Ok(Event::Open) => (),
            Ok(Event::Message(message)) => {
                app.emit(&format!("nb_{endpoint}"), message.data).unwrap();
            }
            Err(err) => {
                app.emit("nb_error", format!("{err:?}")).unwrap();
            }
        }
    }

    panic!()
}
