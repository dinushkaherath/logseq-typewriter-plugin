import "@logseq/libs";
import typewriterSvgContent from "./typewriter.svg";

const typewriterSvgString = typewriterSvgContent.content;

/**
 * user model
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
    console.log("Scrolling to cursor position", e.key);
    const cursorPosition = await logseq.Editor.getEditingCursorPosition();
    if (cursorPosition) {
      const value_to_center = cursorPosition.rect.y + cursorPosition.top;
      const mainContentContainer = top.document.getElementById("main-content-container");
      if (mainContentContainer) {
        const currentScrollY = mainContentContainer.scrollTop;
        const newScrollY = currentScrollY + value_to_center - 300;
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
 * app entry
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

  // external btns
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
}

// bootstrap
logseq.ready(main).catch(console.error);
