console.log("Hello, world!");

class Test{
    public func;
    public x: number = 0;
    kek(){
        this.func = function () {
            this.x++;
        }.bind(this);
    }
}

let test = new Test();
test.kek();
test.func();
test.func();