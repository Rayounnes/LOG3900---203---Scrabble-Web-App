export class Goal {
    id: number = 0;
    name: string = '';
    points: number = 0;
    isCompleted: boolean = false;
    isVerified: boolean = false;
    state: string = '';
    constructor(id: number, name: string, points: number) {
        this.id = id;
        this.name = name;
        this.points = points;
    }
}
