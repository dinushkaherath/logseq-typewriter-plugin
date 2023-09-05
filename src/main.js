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

  async startScrolling(e) {
    const ignoreKeys = ["Escape", "F", "Control", "Alt", "Meta"];
    if (ignoreKeys.includes(e.key)) {
      return;
    }

    console.log("Scrolling to cursor position", e.key);

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
