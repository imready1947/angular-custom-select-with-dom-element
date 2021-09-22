export class EditingSelect {


  idAttribute: any;
  dataStore: any[];
  editor: HTMLInputElement;
  alwaysShowEmptyOption = false;
  onDestroyed: Function | undefined;
  afterInit: Function | undefined;
  getItemLabel: Function;
  selectedValue: string | undefined;
  acceptNewValue: false;
  private selectDiv: HTMLElement;
  private isSelectShown: boolean;
  private eventsDestroyFunctions: (() => void)[] = [];
  private selectedItem: any;

  init() {
    this.showSelect();
    this.hoverToMatchingElement(true);
    this.selectElement(this.findCurrentHoverElement());
    this.editor.focus();
    if (this.afterInit) {
      this.afterInit();
    }

  }

  private onKeyUp(event: KeyboardEvent) {
    if (this.isSelectShown) {
      switch (event.key) {
        case "ArrowDown":
          {
            let currentElement = this.findCurrentHoverElement();
            let nextElement = this.findNextElement(currentElement);
            if (nextElement) {
              this.removeHoverFromAllElements();
              this.onHoverElement(nextElement);
              this.scrollToElement(nextElement);
            }
          }
          break;
        case "ArrowUp":
          {
            let currentElement = this.findCurrentHoverElement();
            let previousElement = this.findPreviousElement(currentElement);
            if (previousElement) {
              this.removeHoverFromAllElements();
              this.onHoverElement(previousElement);
              this.scrollToElement(previousElement);
            }
          }
          break;
        case "End":
        case "PageDown":
          {
            let currentElement = this.findCurrentHoverElement();
            let lastElement = this.findLastElement();
            if (currentElement.dataset.index !== lastElement.dataset.index) {
              this.removeHoverFromAllElements();
              this.onHoverElement(lastElement);
              this.scrollToElement(lastElement);
            }
          }
          break;
        case "Home":
        case "PageUp":
          {
            let currentElement = this.findCurrentHoverElement();
            let firstElement = this.findFirstElement();
            if (currentElement.dataset.index !== firstElement.dataset.index) {
              this.removeHoverFromAllElements();
              this.onHoverElement(firstElement);
              this.scrollToElement(firstElement);
            }
          }
          break;
        case "Escape":
          {
            this.hideSelect();
          }
          break;
        case "Enter":
          {
            let currentElement = this.findCurrentHoverElement();
            this.selectElement(currentElement);
          }
          break;
      }
      // Cancel the default action to avoid it being handled twice
      event.preventDefault();
    } else if (event.key !== "Escape") {
      this.showSelect();
      this.removeHoverFromAllElements();
      this.onHoverElement(this.findFirstElement());
    }
  }

  isValidSelect(): boolean {
    if(this.selectDiv) {
      if(this.acceptNewValue) {
        return true;
      }
    }
    return this.selectDiv ? this.selectedItem && this.selectedItem.label === this.text : true;
  }

  getSelectedItem() {
    return this.selectedItem;
  }

  showSelect() {
    this.selectDiv = document.getElementsByClassName("q2o-select").length ? document.getElementsByClassName("q2o-select")[0] as HTMLElement : null;

    if (!this.selectDiv) {
      this.createSelect();
    }
    this.repositionAndShowSelectDiv();
    this.onHoverElement(this.findFirstElement());
  }

  hideSelect() {
    if (this.selectDiv) {
      this.selectDiv.style.visibility = 'hidden';
      this.isSelectShown = false;
    }
  }

  createSelect() {
    if (this.selectDiv) {
      this.destroySelect();
    }
    this.createSelectDiv();
    this.populateOptionNodes();
  }

  destroySelect() {
    if (this.selectDiv) {
      this.selectDiv.parentNode.removeChild(this.selectDiv);
      this.isSelectShown = false;
    }
    for (let func of this.eventsDestroyFunctions) {
      func();
    }
    this.eventsDestroyFunctions.length = 0;
    if (this.onDestroyed) {
      this.onDestroyed();
    }

  }

  private createSelectDiv() {
    this.selectDiv = document.createElement("div");
    this.selectDiv.className = "q2o-select";
    document.getElementsByTagName("body")[0].appendChild(this.selectDiv);

    // add global click listener
    let documentClickListener = (event: MouseEvent) => {
      let targetElement = event.target as HTMLElement;
      if (!targetElement.classList.contains("custom-select") && !targetElement.classList.contains("q2o-select") && !targetElement.classList.contains("elem")) {
        this.hideSelect();
      }
    };
    document.addEventListener("click", documentClickListener);
    this.eventsDestroyFunctions.push(() => document.removeEventListener("click", documentClickListener));
  }

  private repositionAndShowSelectDiv() {
    let parentPosition = this.editor.getBoundingClientRect();
    this.selectDiv.style.left = parentPosition.left + 'px';

    this.selectDiv.style.top = ((window.innerHeight || document.documentElement.clientHeight) - parentPosition.bottom > 100 ? parentPosition.bottom + 1 : parentPosition.top - 101) + 'px';
    this.selectDiv.style.width = parentPosition.width + 'px';
    this.selectDiv.style.visibility = 'visible';
    this.isSelectShown = true;
  }

  private populateOptionNodes() {

    // clear children before appending
    while (this.selectDiv.firstChild) {
      this.selectDiv.removeChild(this.selectDiv.firstChild);
    }

    for (let i = 0; i < this.dataStore.length; i++) {
      let item = this.dataStore[i];
      let optionDiv = document.createElement("div");
      optionDiv.className = "elem";
      optionDiv.textContent = this.getItemLabel(item);
      optionDiv.dataset.code = item["idAttribute"];
      optionDiv.dataset.label = optionDiv.textContent;
      optionDiv.dataset.index = "" + i;

      let mouseOverEventHandler = () => {
        this.removeHoverFromAllElements();
        this.onHoverElement(optionDiv);
      };
      let mouseOutEventHandler = () => {
        this.removeHoverFromAllElements();
      };
      let clickEventHandler = (event: MouseEvent) => {
        this.unselectAllElements();
        this.selectElement(optionDiv);
        event.stopImmediatePropagation();
      };

      optionDiv.addEventListener("mouseover", mouseOverEventHandler);
      optionDiv.addEventListener("mouseout", mouseOutEventHandler);
      optionDiv.addEventListener("click", clickEventHandler);

      this.eventsDestroyFunctions.push(() => optionDiv.removeEventListener("mouseover", mouseOverEventHandler));
      this.eventsDestroyFunctions.push(() => optionDiv.removeEventListener("mouseout", mouseOutEventHandler));
      this.eventsDestroyFunctions.push(() => optionDiv.removeEventListener("click", clickEventHandler));

      this.selectDiv.appendChild(optionDiv);
    }
  }

  private hoverToMatchingElement(codeMatch = false) {
    this.unselectAllElements();
    this.removeHoverFromAllElements();

    for (let child of this.selectDiv.childNodes) {
      let elem = (child as HTMLElement);
      if (this.text) {
        let matchExpr = codeMatch ? elem.dataset.code.toLocaleLowerCase() === this.text.toLocaleLowerCase() : elem.dataset.label.toLocaleLowerCase().startsWith(this.text.toLocaleLowerCase());
        if (matchExpr) {
          elem.classList.add("hover");
          this.scrollToElement(elem);
          break;
        }
      }
    }
  }

  private onHoverElement(element: HTMLElement) {
    element.classList.add("hover");
  }

  private selectElement(element: HTMLElement) {
    if (!element) {
      return;
    }
    element.classList.add("selected");
    this.text = element.dataset.label;
    this.selectedValue = this.dataStore.filter(item => item[this.idAttribute] + "" === element.dataset.code)[0];
    this.hideSelect();
  }

  private unselectAllElements() {
    this.selectDiv.childNodes.forEach(node =>
      (node as HTMLElement).classList.remove("selected")
    );
    this.selectedValue = null;
  }

  private removeHoverFromAllElements() {
    this.selectDiv.childNodes.forEach(node =>
      (node as HTMLElement).classList.remove("hover")
    );
  }

  private findPreviousElement(element: HTMLElement): HTMLElement {
    let previousElement: HTMLElement = null;
    if (!element) {
      return this.findFirstElement();
    }

    for (let child of this.selectDiv.childNodes) {
      let childElement = (child as HTMLElement);
      if (+childElement.dataset.index + 1 === +element.dataset.index) {
        previousElement = childElement;
        break;
      }
    }
    return previousElement;
  }

  private findNextElement(element: HTMLElement): HTMLElement {
    let nextElement: HTMLElement = null;
    if (!element) {
      return this.findFirstElement();
    }

    for (let child of this.selectDiv.childNodes) {
      let childElement = (child as HTMLElement);
      if (+childElement.dataset.index === +element.dataset.index + 1) {
        nextElement = childElement;
        break;
      }
    }
    return nextElement;
  }

  private findFirstElement(): HTMLElement {
    return this.selectDiv.childNodes[0] as HTMLElement;
  }

  private findLastElement(): HTMLElement {
    return this.selectDiv.childNodes[this.selectDiv.childNodes.length - 1] as HTMLElement;
  }

  private findCurrentHoverElement(): HTMLElement {
    let element: HTMLElement = null;
    for (let child of this.selectDiv.childNodes) {
      let childElement = (child as HTMLElement);
      if (childElement.classList.contains("hover")) {
        element = childElement;
        break;
      }
    }
    return element;
  }

  private findCurrentSelectedElement(): HTMLElement {
    let element: HTMLElement = null;
    for (let child of this.selectDiv.childNodes) {
      let childElement = (child as HTMLElement);
      if (childElement.classList.contains("selected")) {
        element = childElement;
        break;
      }
    }
    return element;
  }

  private scrollToElement(element: HTMLElement) {
    if (element.offsetTop < this.selectDiv.scrollTop) {
      this.selectDiv.scrollTop = element.offsetTop;
    } else {
      const offsetBottom = element.offsetTop + element.offsetHeight;
      const scrollBottom = this.selectDiv.scrollTop + this.selectDiv.offsetHeight;
      if (offsetBottom > scrollBottom) {
        this.selectDiv.scrollTop = offsetBottom - this.selectDiv.offsetHeight;
      }
    }
  }

}