import AudioEffects from './AudioEffects';

export default {
  mixins: [AudioEffects],
  data() {
    return {
      selectedAction: null,
      currentAction: null,
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
    };
  },
  computed: {
    usedLevel() {
      return Math.round(
        this.actions.reduce((sum, action) => sum + action.attributes.level, 0)
      );
    },
    level() {
      return 2 + Math.round(Math.sqrt(this.experience * 6.25));
    },
    infection() {
      return this.experience;
    },
    experience() {
      return (
        (this.map.attributes.cities.reduce(
          (sum, city) => sum + city.infection,
          0
        ) /
          this.map.attributes.total) *
        100
      );
    }
  },
  methods: {
    // Actions
    doCityAction(callback, city, ...args) {
      callback.call(this, city, ...args);
      city.infection < city.value ? this.selected.push(city) : null;
      city.infection = Math.min(city.value, Math.max(0, city.infection));
      city.treatment = Math.min(city.value, Math.max(0, city.treatment));
    }
  }
}
