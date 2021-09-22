import { Component, Input, ViewChild, ElementRef, OnInit, OnDestroy } from '@angular/core';

@Component({
  selector: 'hello',
  templateUrl: './hello.component.html',
  styleUrls: ['./hello.component.css']
})
export class HelloComponent implements OnInit, OnDestroy {

  @Input() text: string;
  selectedValue: { label: string; code: string };
  private selectDiv: HTMLElement;
  private isSelectShown: boolean;
  @ViewChild("textbox") textbox: ElementRef;
  eventsDestroyFunctions: (() => void)[] = [];


  options: { label: string; code: string }[] = [
    { label: " ", code: " " },
    { label: "Hello", code: "H" },
    { label: "Bye", code: "B" },
    { label: "Morning", code: "M" },
    { label: "Evening", code: "E" },
    { label: "Night", code: "N" }
  ];

  ngOnInit() {
    if (this.text) {

    }
  }

  ngOnDestroy() {
    this.destroySelect();
  }

  onModelChange(text) {
    this.text = text;
    this.hoverToMatchingElement();
  }


}
