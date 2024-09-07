let activeFile;

let isRunning = false;
let isRecording = false;

if (document.querySelector("#splash_screen")) {
    anime({
        targets: document.querySelector("#splash_screen"),
        duration: 1000,
        delay: 2000,
        easing: 'easeInOutExpo',
        complete: checkup,
        opacity: 0,
        scale: 1.5,
    });
} else {
    checkup()
}

function checkup() {
    if (document.querySelector("#splash_screen")) { document.querySelector("#splash_screen").style.display = "none"; }
    if (document.querySelector("#checkup")) {
        document.querySelector("#checkup span").innerText = "Checking if AutoMate CLI is installed..."
        window.electron.send("chk_amcli_av");
        window.electron.on("res:chk_amcli_av", (isAmCliAvailable) => {
            if (!isAmCliAvailable) { document.querySelector("#checkup span").innerText = "AutoMate CLI is not installed, installing..."; return }
            document.querySelector("#checkup span").innerText = "Waiting for permissions...";
            window.electron.send("chk_perm_av");
            window.electron.on("res:chk_perm_av", (isPermissionGranted) => {
                if (!isPermissionGranted) { document.querySelector("#checkup span").innerText = "Permission for automation was denied."; return }
                anime({
                    targets: document.querySelector("#checkup"),
                    duration: 1000,
                    delay: 500,
                    easing: 'easeInOutExpo',
                    complete: main,
                    opacity: 0,
                });
            })
        })
    } else {
        main()
    }
}

function main() {
    if (document.querySelector("#checkup")) { document.querySelector("#checkup").style.display = "none"; }
    // TODO: Load files and data
    window.electron.send("load_files");

}

function new_file() {
    window.electron.send("new_file");
}

function play_macro() {
    if (!activeFile || isRunning || isRecording) { return }
    document.getElementById("stdouterr").value = "";
    document.getElementById("code-editor").readOnly = true;
    document.querySelector("button[title='Play Macro']").disabled = true;
    document.querySelector("button[title='Record Macro']").disabled = true;
    document.querySelector("button[title='Stop Macro']").disabled = false;
    isRunning = true;
    window.electron.send("play_macro", activeFile.fullPath);
}

function info() {
    if (!activeFile) { return }
    alert(`FILE INFO\n\n
        Name: ${activeFile.name}\n
        Path: ${activeFile.fullPath}\n
        Size: ${document.getElementById("code-editor").value.length} bytes\n`);
}

function stop() {
    if (isRunning) {
        window.electron.send("stop_macro");
    }
    if (isRecording) {
        window.electron.send("stop_recording");
    }
}

window.electron.on("macro_stopped", (code) => {
    document.getElementById("code-editor").readOnly = false;
    document.querySelector("button[title='Play Macro']").disabled = false;
    document.querySelector("button[title='Record Macro']").disabled = false;
    document.querySelector("button[title='Stop Macro']").disabled = true;
    isRunning = false;
    console.log("Stopped with exit code: " + code);
});

window.electron.on("res:new_file", (info) => {
    console.log(info);
    let div = document.createElement("div");
    div.className = "dark:bg-[#1e1e1e] bg-[#e1e1e1] flex flex-col justify-center items-left py-[10px] px-[20px] rounded-lg dark:text-[#fefefe] dark:hover:bg-[#212121] cursor-pointer hover:bg-[#cecece] transition overflow-hidden w-full min-h-[65px] max-h-[65px]";
    div.setAttribute("data-script-file", info.fullPath);
    let title = document.createElement("span");
    title.className = "font-extrabold truncate pointer-events-none";
    let content = document.createElement("span");
    content.className = "truncate pointer-events-none";

    title.innerText = info.name;
    content.innerText = info.content.split("\n")[0];
    if (content.innerText.length === 0) { content.innerHTML = "<i>Empty Macro Script</i>" }

    div.appendChild(title);
    div.appendChild(content);

    document.getElementById("left-nav").appendChild(div);

    document.getElementById("preview_title").innerText = info.name;
    document.getElementById("code-editor").value = info.content;
    
    document.getElementById("code-editor").readOnly = false;
    

    activeFile = info;
});

document.getElementById("code-editor").addEventListener("input", (event) => {
    activeFile.content = document.getElementById("code-editor").value;

    window.electron.send("update_file", activeFile);
});

// document.querySelectorAll("div[data-file-item]").forEach((element) => {
//     element.addEventListener("click", (event) => {
//         window.electron.send("open_file", element.getAttribute("data-script-file"));
//     });
// });

document.addEventListener("click", (e) => {
    if (e.target.getAttribute("data-script-file")) {
        console.log(e.target.getAttribute("data-script-file"));
        window.electron.send("open_file", e.target.getAttribute("data-script-file"));
    }
});

window.electron.on("res:open_file", (info) => {
    document.getElementById("code-editor").value = info.content;
    document.getElementById("preview_title").innerText = info.name;
    activeFile = info;
})

// document.getElementById("code-editor").addEventListener("keydown", (e) => {
//     if ((e.ctrlKey || e.metaKey) && e.key === "/") {
//         e.preventDefault();

//         const start = document.getElementById("code-editor").selectionStart;
//         const end = document.getElementById("code-editor").selectionEnd;
//         const text = document.getElementById("code-editor").value;
//         console.log(start, end, text);
//         if (start === end) { // no selection, prepend "-- "
//             const lines = text.split("\n");
//             const currentLine = lines[lines.length - 1];
//             const currentLineIndex = lines.length - 1;
//             const beforeLine = text.substr(0, start - currentLine.length);
//             const afterLine = text.substr(end);

//             document.getElementById("code-editor").value = beforeLine + '-- ' + currentLine + afterLine;
//             document.getElementById("code-editor").selectionStart = document.getElementById("code-editor").selectionEnd = start + 3;
//         } else { // selection, wrap between " --< " and " >-- "
//             const beforeSelection = text.substring(0, start);
//             const selectedText = text.substring(start, end);
//             const afterSelection = text.substring(end);

//             document.getElementById("code-editor").value = beforeSelection + '--< ' + selectedText + ' >--' + afterSelection;
//             document.getElementById("code-editor").selectionStart = start + 5; // Position after `--< `
//             document.getElementById("code-editor").selectionEnd = end + 5 + 4; // Position before ` >--`
//         }
//     }
// });

document.addEventListener("keydown", (e) => {
    if (!(e.shiftKey || e.altKey) && ((window.electron.os.name === "darwin" && e.metaKey && !e.ctrlKey) || (window.electron.os.name !== "darwin" && e.ctrlKey && !e.metaKey)) && e.key === "n") { // CMD/CTRL + N
        new_file();
    }
    if (!(e.shiftKey || e.altKey) && ((window.electron.os.name === "darwin" && e.metaKey && !e.ctrlKey) || (window.electron.os.name !== "darwin" && e.ctrlKey && !e.metaKey)) && e.key === "Enter") { // CMD/CTRL + Return/Enter
        play_macro();
    }
    if (!(e.shiftKey || e.altKey || e.ctrlKey || e.metaKey) && e.key === "Escape") { // ESC
        stop();
    }
    if (!(e.shiftKey || e.altKey) && ((window.electron.os.name === "darwin" && e.metaKey && !e.ctrlKey) || (window.electron.os.name !== "darwin" && e.ctrlKey && !e.metaKey)) && e.key === "i") { // CMD/CTRL + I
        info();
    }
    // if (!(e.shiftKey || e.altKey) && ((window.electron.os.name === "darwin" && e.metaKey && !e.ctrlKey) || (window.electron.os.name !== "darwin" && e.ctrlKey && !e.metaKey)) && e.key === "r") { // CMD/CTRL + R
    //     start_record();
    // }
});

window.electron.on("macro_stderr", (data) => {
    console.log(data);
    document.getElementById("stdouterr").value += data;
    document.getElementById("stdouterr").scrollTop = document.getElementById("output").scrollHeight;
    document.getElementById("output").style.display = "";
});

window.electron.on("recording_stopped", (code) => {
    document.getElementById("code-editor").readOnly = false;
    document.querySelector("button[title='Play Macro']").disabled = false;
    document.querySelector("button[title='Record Macro']").disabled = false;
    document.querySelector("button[title='Stop Macro']").disabled = true;
    isRecording = false;
    console.log("Stopped with exit code: " + code);
});

function start_record() {
    if (!activeFile || isRunning || isRecording) { return }
    document.getElementById("code-editor").readOnly = true;
    document.getElementById("code-editor").value = "";
    document.querySelector("button[title='Play Macro']").disabled = true;
    document.querySelector("button[title='Record Macro']").disabled = true;
    document.querySelector("button[title='Stop Macro']").disabled = false;
    isRecording = true;
    window.electron.send("start_recording", activeFile.fullPath);
}
