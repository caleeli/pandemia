import actionFeature from './actionFeature';

const pi = Math.atan(1) * 4;

// COSTS
const canCosts = {
    points(points) {
        return this.points >= points;
    },
    none() {
        return true;
    },
    evolve(action) {
        action.preLevel = action.preLevel === undefined ? 0 : action.preLevel;
        const apply = action.preLevel < action.level;
        action.preLevel = action.level;
        return apply;
    },
    random(value) {
        return this.random(100) <= value;
    }
};
const payCosts = {
    points(points) {
        this.points -= points;
    },
    none() { },
    evolve() { },
    random() { }
};
const energyForAction = {
    points(points) {
        return this.points / points;
    },
    none() {
        return 1;
    },
    evolve() { return 1; },
    random() {
        return 1;
    },
};
// EJECUCION DE ACCIONES
const actionsHandlers = {
    onRadius(
        callback,
        radius = this.click.r0,
        x = this.click.x,
        y = this.click.y
    ) {
        const r2 = radius * radius;
        this.map.attributes.cities.forEach(city => {
            const h2 = (city.x - x) * (city.x - x) + (city.y - y) * (city.y - y);
            if (h2 <= r2 && this.selected.indexOf(city) === -1) {
                this.doCityAction(callback, city);
            }
        });
    },
    onRandomRadius(callback, radius = 8, times = 1) {
        const filtered = this.map.attributes.cities.filter(
            city => city.infection > 0
        );
        filtered.sort((a, b) => a.infection / a.value - b.infection / b.value);
        for (let i = 0, c = 0; (i < filtered.length) && (c < times); i++) {
            let cnt = this.selected.length;
            if (i >= 0) {
                this.handleActions_onRadius(
                    callback,
                    radius,
                    filtered[i].x,
                    filtered[i].y
                );
            }
            this.selected.length > cnt ? c++ : null;
        }
    },
    onRandomInfected(callback, times = 1) {
        const filtered = this.map.attributes.cities.filter(
            city => city.infection > 0
        );
        filtered.sort(() => Math.random() - 0.5);
        for (let i = 0; (i < filtered.length) && (i < times); i++) {
            this.doCityAction(callback, filtered[i]);
        }
    },
    onChain(callback, jumps = 5, jumpSize = this.click.r0 * 2) {
        const r2 = this.click.r0 * this.click.r0;
        let x = this.click.x,
            y = this.click.y,
            xp = x,
            yp = y;
        let ang = Math.random() * 2 * pi;
        let tries = 42;
        let jump = 0;
        while (jumps > 0) {
            let count = 0;
            this.map.attributes.cities.forEach(city => {
                const h2 = (city.x - x) * (city.x - x) + (city.y - y) * (city.y - y);
                if (h2 <= r2) {
                    if (this.selected.indexOf(city) === -1) {
                        count++;
                        this.doCityAction(callback, city, jump);
                    }
                }
            });
            if (!count) {
                if (tries < 1) {
                    break;
                }
                ang += Math.random() * pi * 0.15;
                x = xp + Math.cos(ang) * jumpSize;
                y = yp + Math.sin(ang) * jumpSize;
                tries--;
            } else {
                tries = 42;
                xp = x;
                yp = y;
                ang += Math.random() * pi * 0.15;
                x += Math.cos(ang) * jumpSize;
                y += Math.sin(ang) * jumpSize;
                jumps--;
                jump++;
            }
        }
    },
    addPoints(points) {
        this.points = Math.max(0, Math.min(25 + this.level * 5, this.points + points));
    },
    install(totem, level, width = 16, height = 16, x = this.click.x, y = this.click.y) {
        const action = { attributes: JSON.parse(JSON.stringify(this.action(totem))) };
        action.attributes.level = level;
        const owner = {
            x,
            y,
            width,
            height,
            action,
        };
        action.attributes.owner = owner;
        this.tokens.push(owner);
    },
    randomCity(x, y, radius, filter = () => true) {
        const h2 = radius * radius;
        const cities = this.map.attributes.cities.filter(city => ((city.x - x) * (city.x - x) + (city.y - y) * (city.y - y)) <= h2 && filter(city));
        return cities[Math.floor(Math.random() * cities.length)];
    },
    moveUnit(img, source, target, v = 40) {
        const h = Math.sqrt((target.x - source.x) * (target.x - source.x) + (target.y - source.y) * (target.y - source.y));
        if (h == 0) {
            return;
        }
        const T = h / v;
        const ang = Math.atan2(target.y - source.y, target.x - source.x) / pi * 180;
        const vx = v * (target.x - source.x) / h;
        const vy = v * (target.y - source.y) / h;
        /*
        const ax = a * (target.x - source.x) / h;
        const ay = a * (target.y - source.y) / h;
        const T = h / v;
        0  = (- h) + t * v + (0.5 * a) * t * t;
        axx + bx + c = 0;
        x = (-b + Math.sqrt(b*b-4a*c)) / 2 / a
        T = (-v + Math.sqrt(v*v-4*(0.5 * a)*c)) / 2 / (0.5 * a)*/
        return new Promise((resolve) => {
            this.animations.push({
                source,
                target,
                x: t => source.x + t * vx,
                y: t => source.y + t * vy,
                width: 16,
                height: 16,
                ang: () => ang,
                t: 0,
                T,
                img,
                resolve
            });
        });
    }
};

export default {
    data() {
        return {
            tokens: [],
            animations: [],
        };
    },
    methods: {
        animationPosition(ani) {
            return 'translate(' + ani.x(ani.t) + ',' + ani.y(ani.t) + ') rotate(' + ani.ang(ani.t) + ')';
        },
        random(factor = 1) {
            return Math.random() * factor;
        },
        action(name) {
            return this.actions.find(action => action.attributes.name === name).attributes;
        },
        callAction(name) {
            const action = typeof name === 'string' ? this.actions.find(action => action.attributes.name === name) : name;
            action && action.attributes.level > 0 && this.canAction(action) ? this.doAction(action) : null;
        },
        doAction(name) {
            const action = typeof name === 'string' ? this.actions.find(action => action.attributes.name === name) : name;
            console.log(action.attributes.name, action.attributes.level);
            // pay the action
            this.payAction(action);
            // add action ev
            this.handleActions(action);
        },
        // Calculo de costo
        ...actionFeature("canAction", "cost", canCosts, true),
        ...actionFeature("payAction", "cost", payCosts),
        // Agrega los handlers para la acciones
        ...actionFeature("handleActions", "actions", actionsHandlers),
        ...actionFeature("energyForAction", "cost", energyForAction, true),
    }
}
