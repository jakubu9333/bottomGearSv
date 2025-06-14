export class BottomGearObject extends DurableObject implements BottomDurableObjects {
	constructor(ctx, env) {
		// Required, as we're extending the base class.
		super(ctx, env);
	}
}

export class BottomGearObjDev implements BottomDurableObjects {
}

interface BottomDurableObjects {

}
