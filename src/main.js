import "@logseq/libs";
import typewriterSvgContent from "./typewriter.svg";

const typewriterSvgString = typewriterSvgContent.content;

/** settings **/
const settingsSchema = [
  {
    key: "hotkey",
    type: "string",
    title: "Toggle Typewriter Mode Hotkey (Default hotkey: mod + T)",
    description: "Set a hotkey to toggle typewriter mode",
    default: "mod+T", // Default hotkey (mod + T)
  },
  {
    key: "smoothDocumentFlow",
    type: "boolean",
    title: "",
    description: "Up/Down moves 1 line instead of top or bottom of block",
    default: true,
  },
  {
    key: "smoothAnimation",
    type: "boolean",
    title: "",
    description: "smoothly moves to cursor",
    default: true,
  },
];

/**
 * User model
 */
const model = {
  togglePluginState(e) {
    pluginState.sendMessage();
    if (pluginState.isTypewriterEnabled) {
      pluginState.startTypewriter();
    } else {
      pluginState.stopTypewriter();
    }
  },
};

const pluginState = {
  isTypewriterEnabled: false,
  previousBlockUuid: null,
  typewriterAnimation: true,

  async startScrolling(e) {
    const ignoreKeys = new Set(["Escape", "F", "Control", "Alt", "Meta", "Shift"]);
    if (ignoreKeys.has(e.key)) {
      return;
    }

    const cursorPosition = await logseq.Editor.getEditingCursorPosition();
    if (cursorPosition) {
      const valueToCenter = cursorPosition.rect.y + cursorPosition.top;
      const mainContentContainer = top.document.getElementById("main-content-container");

      if (mainContentContainer) {
        const currentScrollY = mainContentContainer.scrollTop;
        const newScrollY = currentScrollY + valueToCenter - 300;
        mainContentContainer.scrollTo({ top: newScrollY, behavior: model.typewriterAnimation ? "smooth" : "auto" });
      }
    }
  },

  async moveAndChangeBlocks(e) {
    const currentBlock = await logseq.Editor.getCurrentBlock();
    if (currentBlock) {
      // Get the UUID of the current block
      const currentBlockUuid = currentBlock.uuid;

      // Check if the pressed key is "ArrowUp" or "ArrowDown"
      if (e.key === "ArrowUp" || e.key === "ArrowDown") {
        // Check if the previous block UUID is different from the current block UUID
        if (pluginState.previousBlockUuid !== currentBlockUuid) {
          await logseq.Editor.editBlock(currentBlockUuid, {
            pos: e.key === "ArrowUp" ? currentBlock.content.length : 0,
          });
          if (pluginState.isTypewriterEnabled) {
            pluginState.startScrolling(e);
          }
        }
        // Update the previous block UUID in the plugin state
        pluginState.previousBlockUuid = currentBlockUuid;
      }

      // // Find the HTML element associated with the current block
      // const element = top.document.querySelector(`[blockid="${targetUuid}"]`);

      // // Check if the pressed key is "ArrowUp" or "ArrowDown"
      // if (e.key === "ArrowUp" || e.key === "ArrowDown") {
      //   // Check if the previous block UUID is different from the current block UUID and if the HTML element exists
      //   if (pluginState.previousBlockUuid !== currentBlock.uuid && element) {
      //     // Find the textarea element inside the HTML element
      //     const textArea = element.querySelector("textarea");
      //     if (textArea) {
      //       // Set selectionStart and selectionEnd based on the pressed key
      //       textArea.selectionStart = e.key === "ArrowUp" ? textArea.value.length : 0;
      //       textArea.selectionEnd = textArea.selectionStart;
      //       if (pluginState.isTypewriterEnabled) {
      //         pluginState.startScrolling(e);
      //       }
      //     }
      //   }
      // }
    } else {
      // If there is no current block, reset the previous block UUID in the plugin state
      pluginState.previousBlockUuid = null;
    }
  },

  startTypewriter() {
    top.document.addEventListener("keydown", this.startScrolling);
  },

  stopTypewriter() {
    top.document.removeEventListener("keydown", this.startScrolling);
  },

  sendMessage() {
    this.isTypewriterEnabled = !this.isTypewriterEnabled;
    const message = this.isTypewriterEnabled ? "Typewriter Mode ENABLED" : "Typewriter Mode DISABLED";
    logseq.UI.showMsg(message);
  },
};

/**
 * App entry
 */
function main() {
  logseq.setMainUIInlineStyle({
    position: "fixed",
    zIndex: 11,
  });

  const key = logseq.baseInfo.id;
  logseq.provideModel(model);

  logseq.provideStyle(`
    div[data-injected-ui=typewriter-${key}] {
      display: flex;
      align-items: center;
      font-weight: 500;
      position: relative;
    }
  `);

  // External buttons
  logseq.App.registerUIItem("toolbar", {
    key: "typewriter",
    template: `
      <a class="button" id="typewriter-button"
      data-on-click="togglePluginState"
      data-rect>
        ${typewriterSvgString}
      </a>
    `,
  });

  if (logseq.settings.hotkey) {
    logseq.App.registerCommandShortcut(
      {
        binding: logseq.settings.hotkey,
      },
      async () => {
        model.togglePluginState();
      }
    );
  }
  if (logseq.settings.smoothDocumentFlow) {
    top.document.addEventListener("keydown", pluginState.moveAndChangeBlocks);
  }

  model.typewriterAnimation = logseq.settings.smoothAnimation;

  logseq.onSettingsChanged(() => {
    if (logseq.settings.smoothDocumentFlow) {
      top.document.addEventListener("keydown", pluginState.moveAndChangeBlocks);
    } else {
      top.document.removeEventListener("keydown", pluginState.moveAndChangeBlocks);
    }
    model.typewriterAnimation = logseq.settings.smoothAnimation;
  });
}

// Bootstrap
logseq.useSettingsSchema(settingsSchema).ready(main).catch(console.error);
