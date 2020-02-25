<template>
  <panel
    name="Pandemia"
    icon="fas fa-atom"
    class="bg-dark text-white disable-selection"
    :style="{cursor: cursor}"
  >
    <template #actions v-if="map.attributes">
      <template v-if="!chooseEvolution">
        <span
          v-if="map.attributes"
          class="btn btn-sm btn-outline-secondary"
          @click="selectButton(infectionButton);"
        >Infección: {{Math.round(infection)}}%</span>
        <span
          v-if="map.attributes"
          class="btn btn-sm btn-outline-primary"
          @click="selectButton(levelButton);"
        >Nivel: {{level}}</span>
        <span
          v-if="map.attributes"
          class="btn btn-sm btn-outline-success mr-2"
          @click="selectButton(incubationButton);"
        >{{incubationButton.attributes.name}}: {{Math.floor(points)}}</span>
        <button
          v-for="(action,i) in availableAtions"
          :key="i"
          type="button"
          class="btn btn-sm"
          :style="fillButton(energyForAction(action), action)"
          :class="actionClass(action)"
          @click="selectAction(action);selectButton(action);"
        >
          <img
            v-if="action.attributes.icon.substr(0,4)==='svg:'"
            :src="svgs[action.attributes.icon.substr(4)]"
            style="width:16px;height:16px;"
          />
          <i v-else :class="action.attributes.icon"></i>
          <small
            :class="'badge badge-' + action.attributes.color + ' ml-1'"
          >{{action.attributes.level}}</small>
        </button>
      </template>
      <template v-else>
        <button
          v-for="(action,i) in availableEvolution"
          :key="i"
          type="button"
          class="btn btn-sm"
          :style="fillButton(energyForAction(action), action)"
          :class="actionClass(action)"
          @mousemove="selectButton(action);"
          @click="evolve(action);selectAction(action);selectButton(action);"
        >
          <img
            v-if="action.attributes.icon.substr(0,4)==='svg:'"
            :src="svgs[action.attributes.icon.substr(4)]"
            style="width:16px;height:16px;"
          />
          <i v-else :class="action.attributes.icon"></i>
          <small
            :class="'badge badge-' + action.attributes.color + ' ml-1'"
          >{{action.attributes.level}}</small>
        </button>
      </template>
      <button
        class="btn btn-sm btn-danger ml-2"
        :class="{'spot-light': level > usedLevel}"
        type="button"
        @click="gotoEvolve"
      >
        <img :src="svgs.evoluciona" style="width:16px;height:16px;" />
        <small v-if="level > usedLevel" class="badge badge-danger ml-1">{{level - usedLevel}}</small>
      </button>
    </template>
    <p class="alert alert-action-info" v-if="map.attributes && selectedButton">
      <b class="badge badge-info text-uppercase text-white">{{selectedButton.attributes.name}}</b>
      {{selectedButton.attributes.description}}
      <!-- button
        v-if="selectedButton.attributes.level!==undefined && selectedButton.attributes.level < selectedButton.attributes.max"
        type="button"
        class="btn btn-sm btn-primary"
        :disabled="level <= usedLevel"
        @click="evolve(selectedButton)"
      >+1 evolucion</button-->
      <button
        class="btn btn-sm btn-outline-secondary ml-2"
        type="button"
        @click="selectButton(null)"
      >
        <i class="fa fa-times"></i>
      </button>
    </p>
    <svg
      v-if="map.attributes"
      ref="map"
      width="100%"
      :viewBox="'0 0 ' + map.attributes.size.width + ' ' + map.attributes.size.height"
      version="1.1"
      xmlns="http://www.w3.org/2000/svg"
      xmlns:xlink="http://www.w3.org/1999/xlink"
      @click.prevent.stop="clickMap"
      @mousemove.prevent.stop="mouseMap"
    >
      <svg:style type="text/css">
        .token {
        opacity: 0.6;
        }
        .token:hover {
        opacity: 1 !important;
        }
      </svg:style>
      <g stroke="none" stroke-width="1" fill="none" fill-rule="evenodd">
        <g>
          <image
            x="0"
            y="0"
            :width="map.attributes.size.width"
            :height="map.attributes.size.height"
            :xlink:href="map.attributes.map"
          />
          <circle
            v-if="click.r"
            :stroke="pointerStroke()"
            :fill="pointerFill()"
            :cx="click.x"
            :cy="click.y"
            :r="click.r"
          />
          <circle
            v-for="(city,i) in map.attributes.cities"
            :key="i"
            :stroke-width="strokeWidthCity(city)"
            :stroke="strokeCity(city)"
            :fill="fillCity(city)"
            :cx="city.x"
            :cy="city.y"
            r="2"
          />
          <image
            v-for="(token,i) in tokens"
            class="token"
            :key="'tk'+i"
            :x="token.x-token.width*0.5"
            :y="token.y-token.height*0.5"
            :width="token.width"
            :height="token.height"
            :xlink:href="svgs[token.action.attributes.icon.substr(4)]"
          />
          <line
            v-for="(ani,i) in animations"
            :key="'lin'+i"
            :x1="ani.source.x"
            :y1="ani.source.y"
            :x2="ani.target.x"
            :y2="ani.target.y"
            style="stroke:rgba(255,255,255,0.3);stroke-width:1"
          />
          <image
            v-for="(ani,i) in animations"
            :key="'ani'+i"
            :x="-ani.width*0.5"
            :y="-ani.height*0.5"
            :width="ani.width"
            :height="ani.height"
            :xlink:href="svgs[ani.img]"
            :transform="animationPosition(ani)"
          />
        </g>
      </g>
    </svg>
  </panel>
</template>

<script>
import "../assets/world_map.png";
import { setInterval } from "timers";
import ActionSelectors from "./mixins/ActionSelectors";
import Actions from "./mixins/Actions";
import Pandemia from "./mixins/Pandemia";
import HasVoice from "./mixins/HasVoice";
import HasImages from "./mixins/HasImages";

export default {
  path: "/pandemia",
  mixins: [
    window.workflowMixin,
    window.ResourceMixin,
    Pandemia,
    ActionSelectors,
    Actions,
    HasVoice,
    HasImages
  ],
  computed: {
    availableEvolution() {
      return this.actions.filter(
        action =>
          action.attributes.level < action.attributes.max &&
          this.level > this.usedLevel
      );
    },
    availableAtions() {
      return this.actions.filter(action => action.attributes.level > 0);
    },
    cursor() {
      if (this.currentAction && this.currentAction.attributes.level >= 1) {
        return "pointer";
      }
      return "not-allowed";
    }
  },
  data() {
    const infoButtons = {
      infectionButton: {
        attributes: {
          name: "Infección",
          description: "Porcentaje de población total que está enferma"
        }
      },
      levelButton: {
        attributes: {
          name: "Nivel",
          description: "Nivel de evolución de la enfermedad"
        }
      },
      incubationButton: {
        attributes: {
          name: "ADN",
          description: "Puntos de incubación para desarrollar la enfermedad"
        }
      }
    };
    return {
      map: this.$api.map.row(1),
      selectedButton: infoButtons.infectionButton,
      currentAction: null,
      actions: this.$api.actions.array(),
      points: 30,
      click: {
        x: 0,
        y: 0,
        r0: 2,
        r: 0,
        t: 0,
        color: [208, 2, 27],
        opacity: 0.7
      },
      selected: [],
      ...infoButtons
    };
  },
  methods: {
    gotoEvolve() {
      this.chooseEvolution = !this.chooseEvolution;
    },
    actionClass(action) {
      const css = {
        "btn-info": action.attributes.automatic && action.attributes.level > 0
      };
      css[`btn-${action.attributes.color}`] = true;
      css["active"] = action === this.currentAction;
      return css;
    },
    fillButton(percentage, action) {
      percentage = isNaN(percentage) ? 0 : percentage;
      const p = Math.max(0, Math.min(100, percentage * 100));
      const color =
        action.attributes.color === "primary" ? "27, 72, 120" : "120, 2, 2";
      return `background: linear-gradient(to right, rgba(${color}, 0.5), rgba(${color}, 0.5) ${p}%, rgba(0, 0, 0, 0.5) ${p +
        10}%, rgba(0, 0, 0, 1) 100%);`;
    },
    selectButton(button) {
      this.selectedButton = button;
    },
    evolve(action) {
      action.attributes.level < action.attributes.max
        ? action.attributes.level++
        : null;
      if (this.level <= this.usedLevel) {
        this.chooseEvolution = false;
      }
    },
    pointerStroke() {
      return (
        "rgba(" +
        this.click.color.join(",") +
        "," +
        this.click.opacity * 1 +
        ")"
      );
    },
    pointerFill() {
      return (
        "rgba(" +
        this.click.color.join(",") +
        "," +
        this.click.opacity * 0.5 +
        ")"
      );
    },
    selectAction(action) {
      if (this.selectPointer(action)) {
        this.currentAction = action;
      }
    },
    fillCity(city) {
      const gradoInfeccion =
        Math.max(0, city.infection - city.treatment) / city.value;
      const gradoSalud = 1 - gradoInfeccion;
      const red = Math.min(255, Math.max(0, gradoInfeccion * 255));
      const green = Math.min(
        255,
        Math.max(0, gradoInfeccion * 80 + gradoSalud * 255)
      );
      const blue = Math.min(255, Math.max(0, gradoInfeccion * 80));
      const alpha = city.value / 200 + 0.5;
      return "rgba(" + red + "," + green + "," + blue + "," + alpha + ")";
    },
    strokeWidthCity(city) {
      if (this.selected.indexOf(city) === -1) {
        return 0;
      }
      return this.click.opacity === 1 ? Math.min(4, this.click.r) : 1;
    },
    strokeCity(city) {
      if (this.selected.indexOf(city) === -1) {
        return "";
      }
      const red = 255;
      const green = 155 + city.value;
      const blue = 0;
      return "rgba(" + red + "," + green + "," + blue + ",0.8)";
    },
    mouseMap(e) {
      if (this.click.opacity === 1) {
        return;
      }
      if (!this.currentAction || !this.canAction(this.currentAction)) {
        this.click.opacity = 0;
        return;
      }
      this.click.x = Math.round(
        (e.offsetX / this.$refs.map.clientWidth) *
          this.map.attributes.size.width
      );
      this.click.y = Math.round(
        (e.offsetY / this.$refs.map.clientHeight) *
          this.map.attributes.size.height
      );
    },
    clickMap(e) {
      let canAction = true;
      if (
        !this.currentAction ||
        !(
          this.currentAction.attributes.level > 0 &&
          (canAction = this.canAction(this.currentAction))
        )
      ) {
        this.speak(
          !canAction ? "Not enough DNA points" : "Feature not yet evolved"
        );
        this.click.opacity = 0;
        return;
      }
      this.selectAction(this.currentAction);
      this.click.opacity = 0.7;
      this.mouseMap(e);
      this.click.r = this.click.r0;
      this.click.t = 0;
      this.click.opacity = 1;
      this.selected.splice(0);
      this.doAction(this.currentAction);
    }
  },
  mounted() {
    setInterval(() => {
      if (this.click.t < 10) {
        this.click.t++;
        this.click.r = Math.max(
          0,
          this.click.r0 - 0.5 * this.click.t * this.click.t
        );
      } else {
        this.click.t = 0;
        this.click.opacity = 0.7;
      }
      for (let i = 0; i < this.animations.length; i++) {
        let ani = this.animations[i];
        ani.t += 0.1;
        if (ani.t >= ani.T) {
          ani.t = ani.T;
          ani.resolve(ani);
          this.animations.splice(i, 1);
          i--;
        }
      }
    }, 100);
    // Automatic actions
    let cleanSelected = 0;
    setInterval(() => {
      cleanSelected = (cleanSelected + 1) % 3;
      cleanSelected ? null : this.selected.splice(0);
      this.actions.forEach(action => {
        action.attributes.automatic ? this.callAction(action) : null;
      });
      this.tokens.forEach(token => {
        token.action.attributes.automatic
          ? this.callAction(token.action)
          : null;
      });
    }, 1000);
  }
};
</script>

<style scoped>
.btn-danger {
  background-color: rgba(120, 2, 2, 0.5);
}
.disable-selection {
  -moz-user-select: none;
  -ms-user-select: none;
  -khtml-user-select: none;
  -webkit-user-select: none;
  -webkit-touch-callout: none;
}
.spot-light {
  -webkit-animation-name: splight;
  -webkit-animation-duration: 1s;
  -webkit-animation-iteration-count: infinite;
  -webkit-animation-direction: alternate;
  animation-name: splight;
  animation-duration: 1s;
  animation-iteration-count: infinite;
  animation-direction: alternate;
}

@-webkit-keyframes splight {
  from {
    box-shadow: 0px 0px 8px grey;
  }
  to {
    box-shadow: 0px 0px 0px grey;
  }
}
@keyframes splight {
  from {
    box-shadow: 0px 0px 8px grey;
  }
  to {
    box-shadow: 0px 0px 0px grey;
  }
}
.alert-action-info {
  position: absolute;
  right: 2em;
  color: #383d41;
  background-color: rgba(226, 227, 229, 0.8);
  border-color: #d6d8db;
}
</style>