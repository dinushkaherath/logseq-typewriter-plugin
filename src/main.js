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
];

/**
 * User model
 */
const model = {
  togglePluginState(e) {
    pluginState.sendMessage();
    if (pluginState.isPluginEnabled) {
      pluginState.startEventListener();
    } else {
      pluginState.stopEventListener();
    }
  },
};

const pluginState = {
  isPluginEnabled: false,
  previousBlockUuid: null,

  async startScrolling(e) {
    const ignoreKeys = new Set(["Escape", "F", "Control", "Alt", "Meta"]);
    if (ignoreKeys.has(e.key)) {
      return;
    }
    const currentBlock = await logseq.Editor.getCurrentBlock();
    if (currentBlock) {
      // Get the UUID of the current block
      const targetUuid = currentBlock.uuid;
      // Find the HTML element associated with the current block
      const element = top.document.querySelector(`[blockid="${targetUuid}"]`);

      // Check if the pressed key is "ArrowUp" or "ArrowDown"
      if (e.key === "ArrowUp" || e.key === "ArrowDown") {
        // Check if the previous block UUID is different from the current block UUID and if the HTML element exists
        if (pluginState.previousBlockUuid !== currentBlock.uuid && element) {
          // Find the textarea element inside the HTML element
          const textArea = element.querySelector("textarea");
          if (textArea) {
            // Set selectionStart and selectionEnd based on the pressed key
            textArea.selectionStart = e.key === "ArrowUp" ? textArea.value.length : 0;
            textArea.selectionEnd = textArea.selectionStart;
          }
        }
        // Update the previous block UUID in the plugin state
        pluginState.previousBlockUuid = currentBlock.uuid;
      }
    } else {
      // If there is no current block, reset the previous block UUID in the plugin state
      pluginState.previousBlockUuid = null;
    }

    const cursorPosition = await logseq.Editor.getEditingCursorPosition();

    if (cursorPosition) {
      const valueToCenter = cursorPosition.rect.y + cursorPosition.top;
      const mainContentContainer = top.document.getElementById("main-content-container");

      if (mainContentContainer) {
        const currentScrollY = mainContentContainer.scrollTop;
        const newScrollY = currentScrollY + valueToCenter - 300;
        mainContentContainer.scrollTo({ top: newScrollY });
      }
    }
  },

  startEventListener() {
    top.document.addEventListener("keydown", this.startScrolling);
  },

  stopEventListener() {
    top.document.removeEventListener("keydown", this.startScrolling);
  },

  sendMessage() {
    this.isPluginEnabled = !this.isPluginEnabled;
    const message = this.isPluginEnabled ? "Typewriter Mode ENABLED" : "Typewriter Mode DISABLED";
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
}

// Bootstrap
logseq.useSettingsSchema(settingsSchema).ready(main).catch(console.error);
